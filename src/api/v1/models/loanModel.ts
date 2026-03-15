export interface Loan {
    id: number,
    applicant: string,
    amount: number,
    status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'flagged',
    createdAt: string
}

export interface AuthorizationOptions {
    hasRole: Array<"admin" | "manager" | "officer">;
    allowSameUser?: boolean;
}

export let sampleData: Loan[] = [
    {
        id: 1,
        applicant: 'John Smith',
        amount: 50000,
        status: 'pending',
        createdAt: '2025-01-10T10:00:00.000Z'
    },
    {
        id: 2,
        applicant: 'Sarah Johnson',
        amount: 150000,
        status: 'under_review',
        createdAt: '2025-01-08T10:00:00.000Z'
    },
    {
        id: 3,
        applicant: 'Michael Chen',
        amount: 500000,
        status: 'pending',
        createdAt: '2025-01-05T10:00:00.000Z'
    },
    {
        id: 4,
        applicant: 'Emily Williams',
        amount: 1000000,
        status: 'flagged',
        createdAt: '2025-01-03T10:00:00.000Z'
    }
]