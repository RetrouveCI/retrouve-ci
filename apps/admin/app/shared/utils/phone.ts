/**
 * An administrator's phone is not an OTP recipient — the backoffice signs in by
 * email — but it lands in the same `user.phoneNumber` column the public app
 * sends codes to, so it obeys the same rule.
 */
export {
	COUNTRY_CODE,
	LOCAL_NUMBER_LENGTH,
	PHONE_ERROR_MESSAGE,
	isValidLocalNumber,
	stripPhoneSpacing,
	toE164,
	toLocalDigits,
} from '@app/contracts/shared'
