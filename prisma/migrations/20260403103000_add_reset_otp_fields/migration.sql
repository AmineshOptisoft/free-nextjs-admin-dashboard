-- Add OTP reset fields for customer and rider password recovery
ALTER TABLE `Customer`
  ADD COLUMN `resetOtpHash` VARCHAR(191) NULL,
  ADD COLUMN `resetOtpExpiry` DATETIME(3) NULL;

ALTER TABLE `Rider`
  ADD COLUMN `resetOtpHash` VARCHAR(191) NULL,
  ADD COLUMN `resetOtpExpiry` DATETIME(3) NULL;
