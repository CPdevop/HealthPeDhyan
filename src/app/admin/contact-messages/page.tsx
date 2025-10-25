import { prisma } from '@/lib/prisma';
import { ContactMessageList } from '@/components/admin/contact-message-list';

export const dynamic = 'force-dynamic';

async function getContactMessages() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  return messages;
}

async function getStats() {
  const [total, newCount, readCount, repliedCount] = await Promise.all([
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { status: 'NEW' } }),
    prisma.contactMessage.count({ where: { status: 'READ' } }),
    prisma.contactMessage.count({ where: { status: 'REPLIED' } }),
  ]);

  return { total, newCount, readCount, repliedCount };
}

export default async function ContactMessagesPage() {
  const [messages, stats] = await Promise.all([
    getContactMessages(),
    getStats(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Contact Messages</h1>
        <p className="mt-2 text-neutral-600">
          Manage and respond to contact form submissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Total Messages</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{stats.total}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">New</p>
          <p className="mt-2 text-3xl font-bold text-primary-600">{stats.newCount}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Read</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{stats.readCount}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Replied</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats.repliedCount}</p>
        </div>
      </div>

      {/* Messages List */}
      <ContactMessageList messages={messages} />
    </div>
  );
}
