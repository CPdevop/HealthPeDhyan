'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, MailOpen, CheckCircle2, Archive, ExternalLink } from 'lucide-react';
import { ContactMessageStatus } from '@prisma/client';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ContactMessageListProps {
  messages: ContactMessage[];
}

export function ContactMessageList({ messages }: ContactMessageListProps) {
  const [filter, setFilter] = useState<ContactMessageStatus | 'ALL'>('ALL');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredMessages = messages.filter((message) => {
    if (filter === 'ALL') return true;
    return message.status === filter;
  });

  const handleStatusChange = async (messageId: string, newStatus: ContactMessageStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred while updating status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: ContactMessageStatus) => {
    const variants: Record<ContactMessageStatus, { variant: any; icon: any }> = {
      NEW: { variant: 'default', icon: Mail },
      READ: { variant: 'secondary', icon: MailOpen },
      REPLIED: { variant: 'default', icon: CheckCircle2 },
      ARCHIVED: { variant: 'secondary', icon: Archive },
    };

    const { variant, icon: Icon } = variants[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'ALL' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('ALL')}
        >
          All ({messages.length})
        </Button>
        <Button
          variant={filter === 'NEW' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('NEW')}
        >
          New ({messages.filter((m) => m.status === 'NEW').length})
        </Button>
        <Button
          variant={filter === 'READ' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('READ')}
        >
          Read ({messages.filter((m) => m.status === 'READ').length})
        </Button>
        <Button
          variant={filter === 'REPLIED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('REPLIED')}
        >
          Replied ({messages.filter((m) => m.status === 'REPLIED').length})
        </Button>
        <Button
          variant={filter === 'ARCHIVED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('ARCHIVED')}
        >
          Archived ({messages.filter((m) => m.status === 'ARCHIVED').length})
        </Button>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-neutral-500">
            No messages found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((message) => (
            <Card
              key={message.id}
              className={`hover:shadow-md transition-shadow ${
                message.status === 'NEW' ? 'border-primary-200 bg-primary-50/30' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(message.status)}
                        <span className="text-xs text-neutral-500">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-neutral-900 truncate">
                        {message.subject}
                      </h3>
                      <p className="text-sm text-neutral-600 mt-1">
                        From: <strong>{message.name}</strong> ({message.email})
                      </p>
                    </div>
                    <a
                      href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(
                        message.subject
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0"
                    >
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                    </a>
                  </div>

                  {/* Message */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                      {message.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-neutral-500 mr-2">Change status:</span>
                    {message.status !== 'NEW' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(message.id, 'NEW')}
                        disabled={isUpdating}
                      >
                        Mark as New
                      </Button>
                    )}
                    {message.status !== 'READ' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(message.id, 'READ')}
                        disabled={isUpdating}
                      >
                        Mark as Read
                      </Button>
                    )}
                    {message.status !== 'REPLIED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(message.id, 'REPLIED')}
                        disabled={isUpdating}
                      >
                        Mark as Replied
                      </Button>
                    )}
                    {message.status !== 'ARCHIVED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(message.id, 'ARCHIVED')}
                        disabled={isUpdating}
                      >
                        Archive
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
