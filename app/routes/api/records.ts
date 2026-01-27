import { data } from 'react-router';
import type { Route } from './+types/records';
import type { Symptom } from '~/types/record';
import prisma from '~/lib/prisma.server';

// GET - Fetch records with filtering
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const dateFrom = url.searchParams.get('dateFrom');
  const dateTo = url.searchParams.get('dateTo');
  const category = url.searchParams.get('category');
  const severity = url.searchParams.get('severity');
  const search = url.searchParams.get('search');

  // Get userId from query params - required for filtering
  const userId = url.searchParams.get('userId');

  // If no userId provided, return empty array (user must be authenticated)
  if (!userId) {
    return data([], { status: 200 });
  }

  const where: Record<string, unknown> = {
    userId, // Always filter by userId
  };

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) {
      (where.date as Record<string, unknown>).gte = new Date(dateFrom);
    }
    if (dateTo) {
      (where.date as Record<string, unknown>).lte = new Date(dateTo);
    }
  }

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { note: { contains: search, mode: 'insensitive' } },
      { dietNotes: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const records = await prisma.record.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    // Filter by severity if specified (needs post-processing since symptoms is JSON)
    let filteredRecords = records;
    if (severity) {
      filteredRecords = records.filter((record) => {
        const symptoms = record.symptoms as Symptom[] | null;
        return symptoms?.some((s) => s.severity === severity);
      });
    }

    return data(filteredRecords, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch records:', error);
    return data({ error: 'Failed to fetch records' }, { status: 500 });
  }
}

// POST - Create new record
// PUT - Update record
// DELETE - Delete record
export async function action({ request }: Route.ActionArgs) {
  const method = request.method;

  if (method === 'POST') {
    try {
      const body = await request.json();

      // userId is required - user must be authenticated
      const userId = body.userId;
      if (!userId) {
        return data({ error: 'userId is required' }, { status: 400 });
      }

      const record = await prisma.record.create({
        data: {
          userId,
          date: body.date ? new Date(body.date) : new Date(),
          symptoms: body.symptoms || [],
          dialysisSchedule: body.dialysisSchedule || null,
          labResults: body.labResults || null,
          bloodPressure: body.bloodPressure || null,
          weight: body.weight || null,
          fluidIntake: body.fluidIntake || null,
          dietNotes: body.dietNotes || null,
          medications: body.medications || null,
          note: body.note || null,
          mood: body.mood || null,
          category: body.category || 'general',
        },
      });
      return data(record, { status: 201 });
    } catch (error) {
      console.error('Failed to create record:', error);
      return data({ error: 'Failed to create record' }, { status: 500 });
    }
  }

  if (method === 'PUT') {
    try {
      const body = await request.json();
      const { id, ...updateData } = body;

      if (!id) {
        return data({ error: 'Record ID is required' }, { status: 400 });
      }

      const record = await prisma.record.update({
        where: { id },
        data: {
          date: updateData.date ? new Date(updateData.date) : undefined,
          symptoms: updateData.symptoms,
          dialysisSchedule: updateData.dialysisSchedule,
          labResults: updateData.labResults,
          bloodPressure: updateData.bloodPressure,
          weight: updateData.weight,
          fluidIntake: updateData.fluidIntake,
          dietNotes: updateData.dietNotes,
          medications: updateData.medications,
          note: updateData.note,
          mood: updateData.mood,
          category: updateData.category,
        },
      });
      return data(record, { status: 200 });
    } catch (error) {
      console.error('Failed to update record:', error);
      return data({ error: 'Failed to update record' }, { status: 500 });
    }
  }

  if (method === 'DELETE') {
    try {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');

      if (!id) {
        return data({ error: 'Record ID is required' }, { status: 400 });
      }

      await prisma.record.delete({
        where: { id },
      });
      return data({ success: true }, { status: 200 });
    } catch (error) {
      console.error('Failed to delete record:', error);
      return data({ error: 'Failed to delete record' }, { status: 500 });
    }
  }

  return data({ error: 'Method not allowed' }, { status: 405 });
}
