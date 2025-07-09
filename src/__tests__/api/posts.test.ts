import { GET } from '@/app/api/posts/route';
import { getServerSession } from 'next-auth';

jest.mock('next-auth', () => ({
    getServerSession: jest.fn(),
}));

// Mock complet de prisma
jest.mock('@/lib/prisma', () => {
    return {
        user: {
            findUnique: jest.fn(),
        },
        post: {
            findMany: jest.fn(),
        },
        like: {
            count: jest.fn(),
            findFirst: jest.fn(),
        },
        comment: {
            count: jest.fn(),
            findMany: jest.fn(),
        },
    };
});

import prisma from '@/lib/prisma';

describe('GET /api/posts', () => {
    it('renvoie les posts de l’utilisateur et ses amis', async () => {
        // Cast en jest.Mock pour que TS accepte mockResolvedValue
        (getServerSession as jest.Mock).mockResolvedValue({
            user: { email: 'salma@example.com' },
        });

        (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1' });

        (prisma.post.findMany as jest.Mock).mockResolvedValue([
            {
                id: 'post-1',
                userId: 'user-1',
                title: 'Post test',
                body: 'Contenu test',
                createdAt: new Date(),
                updatedAt: new Date(),
                imageUrl: null,
                user: {
                    id: 'user-1',
                    name: 'Salma',
                    image: 'salma.jpg',
                },
            },
        ]);

        (prisma.like.count as jest.Mock).mockResolvedValue(3);
        (prisma.comment.count as jest.Mock).mockResolvedValue(2);
        (prisma.like.findFirst as jest.Mock).mockResolvedValue({ id: 'like-1' });
        (prisma.comment.findMany as jest.Mock).mockResolvedValue([]);

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data[0].title).toBe('Post test');
    });
});
