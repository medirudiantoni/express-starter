/*
  Warnings:

  - A unique constraint covering the columns `[model,action]` on the table `permission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "permission_model_action_key" ON "permission"("model", "action");
