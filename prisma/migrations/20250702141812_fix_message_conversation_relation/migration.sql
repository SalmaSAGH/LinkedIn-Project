/*
  Warnings:

  - You are about to drop the `_ConversationToMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ConversationToMessage" DROP CONSTRAINT "_ConversationToMessage_A_fkey";

-- DropForeignKey
ALTER TABLE "_ConversationToMessage" DROP CONSTRAINT "_ConversationToMessage_B_fkey";

-- DropTable
DROP TABLE "_ConversationToMessage";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
