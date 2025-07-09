

jest.mock('next/server', () => {
    return {
        NextRequest: class {
            constructor(urlOrRequest) {
                if (typeof urlOrRequest === 'string') {
                    this.url = urlOrRequest;
                } else if (urlOrRequest && typeof urlOrRequest.url === 'string') {
                    this.url = urlOrRequest.url;
                }
                this.headers = new Map();
            }
            // Simuler la méthode json() pour PUT/DELETE
            async json() {
                return this._json || {};
            }
            // Permet d'assigner les données du body JSON dans les tests
            setJson(json) {
                this._json = json;
            }
            // Simuler headers.get()
            get headers() {
                return {
                    get: (key) => {
                        return this._headers?.[key.toLowerCase()] || null;
                    }
                };
            }
            set headers(val) {
                this._headers = val;
            }
        },
        NextResponse: {
            json: jest.fn((data, init) => ({
                status: init?.status || 200,
                json: async () => data,
            })),
        },
    };
});
