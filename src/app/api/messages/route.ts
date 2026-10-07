import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSuccessResponse, createErrorResponse } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId') || undefined;

    const messages = db.messages.getAll(candidateId);
    return createSuccessResponse(
      { messages, count: messages.length },
      'Messages retrieved successfully.',
      200
    );
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to fetch messages', [error.message], 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidateId, senderId, senderName, senderRole, content, category } = body;

    if (!candidateId || !content || !senderName) {
      return createErrorResponse('Missing required message parameters', ['REQUIRED_FIELDS_MISSING'], 400);
    }

    const newMessage = db.messages.send({
      candidateId,
      senderId: senderId || 'user-anonymous',
      senderName,
      senderRole: senderRole || 'candidate',
      content,
      category: category || 'general',
    });

    db.auditLogs.add({
      performedBy: senderName,
      action: 'IN_APP_MESSAGE_SENT',
      candidateId,
      details: `Message sent under category [${category || 'general'}]: ${content.substring(0, 50)}...`,
    });

    return createSuccessResponse({ message: newMessage }, 'Message sent successfully', 201);
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to send message', [error.message], 500);
  }
}

