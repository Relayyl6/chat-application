import swaggerJsdoc from 'swagger-jsdoc';
import { API_URL } from './env.config';
import path from 'path';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Chat Application API',
            version: '1.0.0',
            description: 'Real-time chat application with WebSocket support',
            contact: {
                name: 'Developer',
                email: 'oseghaleleonard39@gmail.com'
            }
        },
        servers: [
            {
                url: `${API_URL}`,
                description: API_URL.includes('localhost') ? 'Development server' : 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                        avatar: { type: 'string' },
                        status: { type: 'string', enum: ['online', 'offline', 'away'] },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Channel: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        type: { type: 'string', enum: ['direct', 'group', 'channel'] },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        avatar: { type: 'string' },
                        members: { type: 'array' },
                        createdBy: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Message: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        channelId: { type: 'string' },
                        senderId: { type: 'string' },
                        content: { type: 'string' },
                        autoId: { type: 'number' },
                        readBy: { type: 'array', items: { type: 'string' } },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        error: { type: 'string' },
                        statusCode: { type: 'number' }
                    }
                }
            }
        }
    },
    apis: [
        // Use dynamic paths that work in both dev and production
        path.join(__dirname, '../routes/auth.routes.js'),
        path.join(__dirname, '../routes/channel.routes.js'),
        path.join(__dirname, '../routes/message.routes.js')
    ]
};

export const swaggerSpec = swaggerJsdoc(options);
