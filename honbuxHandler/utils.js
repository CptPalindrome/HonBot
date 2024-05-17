class Utils { 
    checkIfUserExistsOrCreateNewUser(id, username, honbuxData) {
        // if they don't exist, add them
        if (!honbuxData?.find((userdata) => userdata?.id === id || userdata?.username === username)) {
            honbuxData.push({
                id,
                username,
                honbalance: 100
            });
        } 
        return honbuxData;
    }

    modifyData(honbuxData, id, paramsToChange) {
        let endData = { honbuxData: honbuxData.map((userdata) => { 
            if(userdata.id === id) {                    
                paramsToChange.forEach((param) => {
                    if (param.propFunc ==='set') {
                        userdata[param.propName] = param.propValue;
                    } else if (param.propFunc === 'inc') {
                        userdata[param.propName] ? userdata[param.propName] += param.propValue : userdata[param.propName] = param.propValue;
                    }
                });
            }
            return userdata;
        })};
        return endData;
    }

    gameMetrics(metricsData, params) {
        
        const data = metricsData;
        params.forEach((param) => {
            if (param.propFunc ==='set') {
                data[param.propName] = param.propValue;
            } else if (param.propFunc === 'inc') {
                data[param.propName] ? data[param.propName] += param.propValue : data[param.propName] = param.propValue;
            }
        })
        
        return { metrics: data };
    }
}

module.exports = Utils;