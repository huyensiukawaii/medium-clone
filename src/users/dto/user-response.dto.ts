import { User } from '@prisma/client';

export class UserResponseDto {
    user: {
        email: string;
        token: string;
        username: string;
        bio: string | null;
        image: string | null;
    };

    constructor(user: User, token: string) {
        this.user = {
        email: user.email,
        token: token,
        username: user.username,
        bio: user.bio,
        image: user.image,
        };
    }
}
