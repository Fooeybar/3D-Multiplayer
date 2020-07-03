const iomsg={
    connection:'connection'
    ,newPlayer:'P+'
    ,dcPlayer:'P-'
    ,players:'P'
    ,ground:'G'
    ,walls:'W'
    ,objects:'O'
    ,models:'M'
    ,fog:'F'
    ,lights:'L'
};

const socketmsg={
    newPlayer:'p+'
    ,newPlayerRet:'p'
    ,move:'mv'
    ,dc:'p-'
};

module.exports={iomsg,socketmsg};
