const logger = require('../logger');

class BankHelper {
    depositChecker(amount, userdata, investData) {
        
    }

    dailyBankProcess(investData) {
        this.accrueInterest(investData);
        if (this.checkIfRobbed()) {
            this.destroyBank(investData);
        }
    }

    checkIfRobbed() {

    }

    accrueInterest(investData) {

    }

    destroyBank(investData) {

    }
}

module.exports = BankHelper;