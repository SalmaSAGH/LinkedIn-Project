import { GET } from '@/app/api/posts/route';
import { getServerSession } from 'next-auth';

jest.mock('next-auth', () => ({
    getServerSession: jest.fn(),
}));

jest.mock('@/lib/prisma', () => {
    const prismaMock = {
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

    return {
        __esModule: true,
        default: prismaMock,
    };
});

const prismaMock = jest.requireMock('@/lib/prisma').default;

describe('GET /api/posts', () => {
    it('renvoie les posts de l’utilisateur et ses amis', async () => {
        (getServerSession as jest.Mock).mockResolvedValue({
            user: { email: 'salma@example.com' },
        });

        prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });

        prismaMock.post.findMany.mockResolvedValue([
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

        prismaMock.like.count.mockResolvedValue(3);
        prismaMock.comment.count.mockResolvedValue(2);
        prismaMock.like.findFirst.mockResolvedValue({ id: 'like-1' });
        prismaMock.comment.findMany.mockResolvedValue([]);

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data[0].title).toBe('Post test');
    });
});
