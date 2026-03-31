import { query, queryOne } from '../config/db.js';

/**
 * Ensures no double booking on slot and no overlapping confirmed/pending sessions for trainer.
 */
export async function assertSlotBookable(slotId, trainerId, excludeBookingId = null) {
  const slot = await queryOne(
    `SELECT id, trainer_id, slot_start, slot_end, is_booked, program_id FROM availability_slots WHERE id = ?`,
    [slotId]
  );
  if (!slot) {
    const err = new Error('Slot not found');
    err.status = 404;
    throw err;
  }
  if (Number(slot.trainer_id) !== Number(trainerId)) {
    const err = new Error('Slot does not belong to this trainer');
    err.status = 400;
    throw err;
  }
  if (slot.is_booked) {
    const existing = await queryOne(
      `SELECT id FROM bookings WHERE slot_id = ? AND status IN ('pending','confirmed','reschedule_pending')`,
      [slotId]
    );
    if (existing && Number(existing.id) !== Number(excludeBookingId)) {
      const err = new Error('Slot is already booked');
      err.status = 409;
      throw err;
    }
  }

  const overlap = await queryOne(
    `
    SELECT b.id FROM bookings b
    JOIN availability_slots s ON s.id = b.slot_id
    WHERE b.trainer_id = ?
      AND b.status IN ('pending','confirmed','reschedule_pending')
      AND s.id <> ?
      AND s.slot_start < ?
      AND s.slot_end > ?
      ${excludeBookingId ? 'AND b.id <> ?' : ''}
    LIMIT 1
    `,
    excludeBookingId
      ? [trainerId, slotId, slot.slot_end, slot.slot_start, excludeBookingId]
      : [trainerId, slotId, slot.slot_end, slot.slot_start]
  );
  if (overlap) {
    const err = new Error('Trainer has a conflicting session at this time');
    err.status = 409;
    throw err;
  }
  return slot;
}

export async function markSlotBooked(slotId, booked) {
  await query(`UPDATE availability_slots SET is_booked = ? WHERE id = ?`, [booked ? 1 : 0, slotId]);
}
