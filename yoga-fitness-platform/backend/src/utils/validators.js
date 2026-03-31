import { body, param, query as q, validationResult } from 'express-validator';

export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, error: 'Validation failed', details: errors.array() });
  }
  next();
}

export const registerRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 characters'),
  body('fullName').trim().isLength({ min: 2, max: 255 }),
  body('role').optional().isIn(['user', 'trainer']),
  body('phone').optional().trim().isLength({ max: 50 }),
];

export const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export const bookingCreateRules = [
  body('slotId').isInt({ min: 1 }).toInt(),
  body('programId').isInt({ min: 1 }).toInt(),
  body('sessionType').isIn(['live', 'recorded', 'personal']),
];

export const reviewRules = [
  body('trainerId').isInt({ min: 1 }).toInt(),
  body('programId').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body('rating').isInt({ min: 1, max: 5 }).toInt(),
  body('comment').optional().trim().isLength({ max: 2000 }),
  body('bookingId').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
];

export const payRules = [body('bookingId').isInt({ min: 1 }).toInt()];

export const progressLogRules = [
  body('caloriesBurned').optional().isInt({ min: 0, max: 10000 }).toInt(),
  body('workoutDelta').optional().isInt({ min: 0, max: 50 }).toInt(),
  body('markAttendance').optional().isBoolean().toBoolean(),
];

export const idParam = [param('id').isInt({ min: 1 }).toInt()];

export const listProgramsQuery = [
  q('goal').optional().isIn(['weight_loss', 'flexibility', 'muscle_gain', 'general']),
  q('workoutType').optional().isIn(['yoga', 'hiit', 'gym', 'meditation']),
  q('minPrice').optional().isFloat({ min: 0 }).toFloat(),
  q('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
  q('trainerId').optional().isInt({ min: 1 }).toInt(),
  q('search').optional().trim().isLength({ max: 200 }),
];

export const listTrainersQuery = [
  q('minRating').optional().isFloat({ min: 0, max: 5 }).toFloat(),
  q('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
  q('goal').optional().isIn(['weight_loss', 'flexibility', 'muscle_gain', 'general']),
  q('workoutType').optional().isIn(['yoga', 'hiit', 'gym', 'meditation']),
  q('availableFrom').optional().isISO8601(),
  q('availableTo').optional().isISO8601(),
];

export const slotsQuery = [
  q('trainerId').optional().isInt({ min: 1 }).toInt(),
  q('from').optional().isISO8601(),
  q('booked').optional().isIn(['0', '1', 'true', 'false']),
];

export const rescheduleRules = [
  body('newSlotId').isInt({ min: 1 }).toInt(),
];
