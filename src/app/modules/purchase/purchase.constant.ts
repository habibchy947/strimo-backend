import { Prisma } from "../../../generated/prisma/client";

export const PurchaseSearchableFields = ['id', 'purchaseType', 'userId', 'mediaId'];
export const PurchaseFilterableFields = [
    'purchaseType',
    'userId',
    'mediaId',
    'media.title',
    'payments.paymentStatus'
];

export const purchaseIncludeConfig: Partial<Record<keyof Prisma.PurchaseInclude, Prisma.PurchaseInclude[keyof Prisma.PurchaseInclude]>> = {
    media: {
        select: {
            id: true,
            title: true,
            posterUrl: true,
            mediaType: true,
        }
    },
    payments: true,
    user: {
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    }
}
