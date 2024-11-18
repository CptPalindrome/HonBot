class WheelHelper {
    constructor() {
        this.wheelCooldown = 36000000;
        this.tiers = process.env.TIERS.split('_');
        this.weights = process.env.WEIGHTS.split('_').map((number) => Number(number));
        this.payoutRatios = [process.env.LOWEST, process.env.LOW, process.env.MEDIUM, process.env.HIGH, process.env.EXTREME]
        this.wheel = [];
        this.weights.forEach((weight, index) => {
            for (let i = 0; i < weight; i++) {
                this.wheel.push(this.tiers[index]);
            }
        })
    }

    spinWheel(userData, bet, guess) {
        const wheelTimeDiff = Date.now() - userData.lastWheelSpin;
        const timeDiffHours = Math.floor((this.wheelCooldown - wheelTimeDiff) / 3600000).toString().padStart(2, '0');
        const timeDiffMinutes = Math.floor((this.wheelCooldown - wheelTimeDiff) % 3600000 / 60000).toString().padStart(2, '0');
        if ((userData.lastWheelSpin && wheelTimeDiff > this.wheelCooldown) || !userData.lastWheelSpin) {
            let spinResult = this.wheel[Math.floor(Math.random() * this.wheel.length)];
            let payout = bet * -1;
            switch (spinResult) {
                case 'Lowest':
                    payout = Math.floor(bet * this.payoutRatios[0]);
                    break;
                case 'Low':
                    payout = Math.floor(bet * this.payoutRatios[1]);
                    break;
                case 'Medium':
                    payout = Math.floor(bet * this.payoutRatios[2]);
                    break;
                case 'High':
                    payout = Math.floor(bet * this.payoutRatios[3]);
                    break;
                case 'Extreme':
                    payout = Math.floor(bet * this.payoutRatios[4]);
                    break;
                case 'Blank':
                    const optionsWithout = this.wheel.filter((option) => {
                        if (option.toLowerCase() !== guess && option !== 'Blank') return option
                    });
                    spinResult = optionsWithout[Math.floor(Math.random() * optionsWithout.length)]
                    break;
            }
    
            payout = Number(payout);
            if (!this.tiers.find((tier) => tier.toLowerCase() === guess) || guess == 'blank') return { valid: false, message: 'Invalid choice. Options are: lowest, low, medium, high, extreme.' };
            if (spinResult.toLowerCase() === guess) {
                const message = this.messageBuilder(payout, spinResult)
                return { payout, result: spinResult, valid: true, message };
            } else {
                payout = bet * -1;
                const message = this.messageBuilder(payout, spinResult)
                return { payout, result: spinResult, valid: true, message };
            }
        } else return { valid: false, message: `You must wait at least \`${timeDiffHours}:${timeDiffMinutes}\` (HH:MM) before you can spin again.` };
    }

    messageBuilder(payout, result,) {
        if (payout > 0) {
            return `**${result}**! You won <:honbux:966533492030730340>**${payout}**. New balance is <:honbux:966533492030730340>**{balance}**`
        } else return `**${result}**... You lose <:honbux:966533492030730340>**${payout}**. New balance is <:honbux:966533492030730340>**{balance}**`
    }
}

module.exports = WheelHelper;