import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

// Types
export type PaymentStatus = "INITIATED" | "PROCESSING" | "SUCCESS" | "FAILED";

export interface PaymentRequest {
  amount: number;
  currency: string;
  sourceId: string;
  destinationId: string;
  idempotencyKey: string;
}

export interface PaymentRecord extends PaymentRequest {
  id: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  logs: string[];
}

// In-memory "Database"
let paymentStore: Record<string, PaymentRecord> = {};
// Idempotency Cache: key -> paymentId
let idempotencyIndex: Record<string, string> = {};

const generateId = () => `pay_${Math.random().toString(36).substr(2, 9)}`;

// Simulated Service
export const PayFlowService = {
  // Reset simulation
  reset: () => {
    paymentStore = {};
    idempotencyIndex = {};
  },

  getAllPayments: async (): Promise<PaymentRecord[]> => {
    await delay(300); // Simulate network
    return Object.values(paymentStore).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getPayment: async (id: string): Promise<PaymentRecord | null> => {
    await delay(200);
    return paymentStore[id] || null;
  },

  initiatePayment: async (req: PaymentRequest): Promise<{ payment: PaymentRecord; isIdempotentReplay: boolean }> => {
    await delay(600); // Simulate processing latency

    // 1. Idempotency Check (Simulating DB Unique Constraint)
    if (idempotencyIndex[req.idempotencyKey]) {
      const existingId = idempotencyIndex[req.idempotencyKey];
      const existingPayment = paymentStore[existingId];
      
      // Simulate "returning existing resource"
      return { 
        payment: {
          ...existingPayment,
          logs: [...existingPayment.logs, `[${new Date().toISOString()}] Idempotency hit: Request ignored, returning existing record.`]
        }, 
        isIdempotentReplay: true 
      };
    }

    // 2. Create New Payment (INITIATED)
    const newId = generateId();
    const now = new Date().toISOString();
    
    const newPayment: PaymentRecord = {
      id: newId,
      ...req,
      status: "INITIATED",
      createdAt: now,
      updatedAt: now,
      logs: [`[${now}] Payment INITIATED. Idempotency Key locked.`]
    };

    // 3. Persist (Simulating Transaction)
    paymentStore[newId] = newPayment;
    idempotencyIndex[req.idempotencyKey] = newId;

    // 4. Simulate Async Processing (Success/Fail)
    // In a real system, this might happen via queue, but we'll simulate the state transition here after a short delay
    setTimeout(() => {
        PayFlowService.processPayment(newId);
    }, 1500);

    return { payment: newPayment, isIdempotentReplay: false };
  },

  processPayment: (id: string) => {
    const payment = paymentStore[id];
    if (!payment || payment.status !== "INITIATED") return;

    // Random success/fail simulation
    const isSuccess = Math.random() > 0.2; // 80% success rate
    const finalStatus = isSuccess ? "SUCCESS" : "FAILED";
    
    paymentStore[id] = {
      ...payment,
      status: finalStatus,
      updatedAt: new Date().toISOString(),
      logs: [
        ...payment.logs, 
        `[${new Date().toISOString()}] Processing complete. Status updated to ${finalStatus}.`
      ]
    };
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
