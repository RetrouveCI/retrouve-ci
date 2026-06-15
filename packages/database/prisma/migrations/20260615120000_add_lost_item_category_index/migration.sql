-- CreateIndex
CREATE INDEX "lost_item_type_moderationStatus_resolutionStatus_category_idx" ON "lost_item"("type", "moderationStatus", "resolutionStatus", "category");
