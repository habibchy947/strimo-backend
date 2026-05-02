import { IRequestUser } from "../../interfaces/req.user.interface";
import { Role, SubscriptionStatus,PaymentStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelper/AppError";
import status from "http-status";
import { prisma } from "../../lib/prisma";

const getAdminDashboardStatsData = async () => {
    const [totalUsers, totalAdminUsers, totalMedia, totalSubscriptions, totalPayments, totalPurchases, totalComments, totalWatchlist, totalReviews, totalReviewLikes, revenueAggregation] = await Promise.all([
        prisma.user.count({ where: { role: Role.USER } }),
        prisma.user.count({ where: { role: Role.ADMIN } }),
        prisma.media.count(),
        prisma.subscription.count(),
        prisma.payment.count(),
        prisma.purchase.count(),
        prisma.comment.count(),
        prisma.watchlist.count(),
        prisma.review.count(),
        prisma.reviewLike.count(),
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: PaymentStatus.COMPLETED }
        })
    ]);

    const totalRevenue = revenueAggregation._sum.amount || 0;

    // Fetch monthly revenue for the last 6 months (optional chart data)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentPayments = await prisma.payment.findMany({
        where: {
            status: 'COMPLETED',
            paidAt: { gte: sixMonthsAgo }
        },
        select: { amount: true, paidAt: true }
    });

    const revenueByMonth = recentPayments.reduce((acc, payment) => {
        const month = payment.paidAt ? payment.paidAt.toLocaleString('default', { month: 'short', year: 'numeric' }) : 'Unknown';
        acc[month] = (acc[month] || 0) + payment.amount;
        return acc;
    }, {} as Record<string, number>);

    // Format for Bar Chart and fill missing months
    const barChartData = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthLabel = d.toLocaleString('default', { month: 'short', year: 'numeric' });
        barChartData.push({
            name: monthLabel,
            revenue: revenueByMonth[monthLabel] || 0
        });
    }

    // Format for Pie Chart (e.g., Transactions distribution)
    const pieChartData = [
        { name: "Subscriptions", value: totalSubscriptions },
        { name: "One-time Purchases", value: totalPurchases }
    ];

    return {
        totalUsers,
        totalAdminUsers,
        totalMedia, 
        totalSubscriptions,
        totalPayments,
        totalPurchases,
        totalComments,
        totalWatchlist,
        totalReviews,
        totalReviewLikes,
        totalRevenue,
        barChartData,
        pieChartData
    };
};

const getUserDashboardStatsData = async (user: IRequestUser) => {
    const [activeSubscription, totalPurchases, totalWatchlistItems, totalReviews] = await Promise.all([
        prisma.subscription.findFirst({
            where: { userId: user.userId, status: 'ACTIVE' }
        }),
        prisma.purchase.count({
            where: { userId: user.userId }
        }),
        prisma.watchlistItem.count({
            where: { watchlist: { userId: user.userId } }
        }),
        prisma.review.count({
            where: { userId: user.userId }
        })
    ]);

    return {
        hasActiveSubscription: !!activeSubscription,
        subscriptionPlan: activeSubscription?.plan || null,
        totalPurchases,
        totalWatchlistItems,
        totalReviews
    };
};

const getDashboardStatsData = async (user: IRequestUser) => {
    let statsData;

    switch (user.role) {
        case Role.ADMIN:
            statsData = await getAdminDashboardStatsData();
            break;
        case Role.USER:
            statsData = await getUserDashboardStatsData(user);
            break;
        default:
            throw new AppError(status.BAD_REQUEST, "Invalid user role");
    }

    return statsData;
};

export const StatsService = {
    getDashboardStatsData
};
