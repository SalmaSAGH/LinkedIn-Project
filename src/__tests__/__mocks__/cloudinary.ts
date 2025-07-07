// __mocks__/cloudinary.ts
export const v2 = {
    uploader: {
        upload: jest.fn().mockResolvedValue({ secure_url: 'https://mock-image-url.com/img.jpg' }),
    },
    config: jest.fn(),
};
