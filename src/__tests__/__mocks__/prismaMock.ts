// src/__tests__/__mocks__/prismaMock.ts
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
