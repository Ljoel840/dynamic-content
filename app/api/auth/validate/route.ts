import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { valid: false, error: 'Servicio de validación local no configurado. Use el servicio externo.' },
    { status: 501 }
  );
}
