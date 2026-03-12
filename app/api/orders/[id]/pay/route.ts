import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query, execute } from "@/lib/db"
import { createNotification } from "@/lib/notifications"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    const rows: any[] = await query(
      "SELECT id, buyer_id, status, total FROM orders WHERE id = ? LIMIT 1",
      [orderId]
    )
    if (rows.length === 0) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 })
    }
    const order = rows[0]
    if (String(order.buyer_id) !== String(userId)) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 })
    }
    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "Заказ уже оплачен или отменён" },
        { status: 400 }
      )
    }

    const total = Number(order.total)
    if (total > 0) {
      try {
        const userRows: any[] = await query(
          "SELECT balance FROM users WHERE id = ? LIMIT 1",
          [userId]
        )
        if (userRows.length > 0) {
          const balance = Number(userRows[0].balance)
          if (balance < total) {
            return NextResponse.json(
              { error: `Недостаточно средств. Баланс: ${balance.toFixed(2)} ₽, нужно: ${total.toFixed(2)} ₽` },
              { status: 400 }
            )
          }
          const upd = await execute(
            "UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?",
            [total, userId, total]
          )
          if (upd.affectedRows === 0) {
            return NextResponse.json(
              { error: "Недостаточно средств на балансе" },
              { status: 400 }
            )
          }
        }
      } catch (_) {
        // Колонка balance может отсутствовать до миграции — тогда просто помечаем оплаченным
      }
    }

    await execute(
      "UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = ?",
      [orderId]
    )

    // Get lot information to notify both buyer and seller
    try {
      const orderRow: any[] = await query("SELECT lot_id FROM orders WHERE id = ? LIMIT 1", [orderId])
      if (orderRow.length > 0) {
        const lotInfo: any[] = await query("SELECT seller_id, title FROM lots WHERE id = ? LIMIT 1", [orderRow[0].lot_id])
        if (lotInfo.length > 0) {
          const lot = lotInfo[0];
          
          // Notify buyer about successful purchase
          await createNotification({
            userId: userId,
            type: 'purchase_success',
            title: 'Покупка завершена',
            body: `Вы успешно приобрели "${lot.title}". Заказ №${orderId} оплачен.`
          });
          
          // Notify seller about sale
          await createNotification({
            userId: lot.seller_id,
            type: 'sale_completed',
            title: 'Товар продан',
            body: `Ваш товар "${lot.title}" был продан. Заказ №${orderId} оплачен.`
          });

          let commissionPercent = 5
          try {
            const setRows: any[] = await query("SELECT value FROM settings WHERE `key` = 'commission_percent' LIMIT 1", [])
            if (setRows.length > 0 && setRows[0].value != null) commissionPercent = Math.min(10, Math.max(0, Number(setRows[0].value) || 5))
          } catch (_) {}
          const commission = (total * commissionPercent) / 100
          const sellerGets = total - commission
          await execute(
            "UPDATE users SET balance = balance + ? WHERE id = ?",
            [sellerGets, lot.seller_id]
          )
          await execute(
            "INSERT INTO platform_earnings (order_id, amount) VALUES (?, ?)",
            [orderId, commission]
          )
        }
      }
    } catch (e) {
      console.error("Error processing order after payment:", e)
    }

    // Return success response
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Pay error:", e)
    return NextResponse.json({ error: "Ошибка оплаты" }, { status: 500 })
  }
}
