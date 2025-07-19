import { clerkClient } from "@clerk/express";

// Middleware to check userId and hasPremiumPlan
//Agar free user hai → free_usage ke chances set karo.
//Agar premium hai → free_usage ki zarurat hi nahi, so usko 0 kar do.

export const auth = async (req, res, next)=>{
    try {
        const {userId, has} = await req.auth();
        const hasPremiumPlan = await has({plan: 'premium'});

        const user = await clerkClient.users.getUser(userId);

        if(!hasPremiumPlan && user.privateMetadata.free_usage){
            req.free_usage = user.privateMetadata.free_usage
        } else{
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: 0
                }
            })
            req.free_usage = 0;
        }

        req.plan = hasPremiumPlan ? 'premium' : 'free';
        next()
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}