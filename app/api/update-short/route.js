import { NextRequest, NextResponse } from 'next/server';

import clientPromise from '../../lib/mongodb';

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, title, tags, meal, favorite } = body;


    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('shortsDB');
    const collection = db.collection('shorts');

    const updateFields = {};

    if (title !== undefined) updateFields.title = title;
    if (tags !== undefined) updateFields.tags = tags;
    if (meal !== undefined) updateFields.meal = meal;
    if (favorite !== undefined) updateFields.favorite = favorite;
    
    const result = await collection.updateOne(
      { id },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount }, { status: 200 });
  } catch (err) {
    console.error('Error in update-short:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}