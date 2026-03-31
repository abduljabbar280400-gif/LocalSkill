<?php

namespace App\Services;

class CommissionService
{
    public function calculate($amount, $percent = 10)
    {
        $platformFee = ($amount * $percent) / 100;
        $freelancerEarnings = $amount - $platformFee;

        return [
            'platform_fee' => round($platformFee, 2),
            'freelancer_earnings' => round($freelancerEarnings, 2),
            'platform_fee_percent' => $percent,
        ];
    }
}