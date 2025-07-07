// src/lib/__mocks__/prisma.ts
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

export default prismaMock;
