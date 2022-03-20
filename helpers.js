import NodeCache from "node-cache";

const TTL = 60 * 60 * 1;
const Cache = new NodeCache({
  stdTTL: TTL,
  checkperiod: TTL * 0.2,
  useClones: false,
});

const GetCache = (key) => {
  if (Cache.has(key)) {
    return Cache.get(key);
  }
};

const SetCache = (key, data) => {
  Cache.set(key, data);
};

const ParseFeeConfigurationSpec = async (Specs) => {
  const FCS = await Specs.map((FCS) => {
    let SpecObj = {
      FeeId: FCS.split(" ")[0],
      FeeCurrency: FCS.split(" ")[1],
      FeeLocale: FCS.split(" ")[2],
      FeeEntity: FCS.split(" ")[3].split("(")[0],
      FeeEntityProperty: FCS.split(" ")[3].split("(")[1].replace(")", ""),
      FeeType: FCS.split(" ")[6],
      FeeValue: FCS.split(" ")[7],
    };
    return SpecObj;
  });
  return FCS;
};

const GetApplicableFCS = async (ParsedFCSData, PayloadFCSData) => {
  const AppliedFCS = await ParsedFCSData.filter((FCS) => {
    const { FeeCurrency, FeeLocale, FeeEntity, FeeEntityProperty } = FCS;
    return (
      (FeeCurrency === PayloadFCSData.FeeCurrency || FeeCurrency === "*") &&
      (FeeLocale === PayloadFCSData.FeeLocale || FeeLocale === "*") &&
      (FeeEntity === PayloadFCSData.FeeEntity || FeeEntity === "*") &&
      (FeeEntityProperty === PayloadFCSData.FeeEntityProperty ||
        FeeEntityProperty === "*")
    );
  });
  return AppliedFCS;
};

const AllocateTransactionFee = async (FCS, Amount) => {
  const FeeVal = FCS["FeeValue"];
  for (const [key, value] of Object.entries(FCS)) {
    if (["FeeType"].includes(key)) {
      if (value === "FLAT") {
        return FeeVal;
      } else if (value === "PERC") {
        return Amount * (Number(FeeVal) / 100);
      } else if (value === "FLAT_PERC") {
        const splitFeeVal = FeeVal.split(":");
        return Number(splitFeeVal[0]) + Amount * (Number(splitFeeVal[1]) / 100);
      }
    }
  }
};

const GetPrioritizedFCS = async (FCS) => {
  const GetMetacharactersValues = (arr) => {
    const MetacharactersValues = arr.filter((x) => x === "*");
    return MetacharactersValues.length;
  };

  const MetacharactersCount = FCS.map((FCS, index) => {
    return {
      index,
      count: GetMetacharactersValues(Object.values(FCS)),
    };
  });

  return await MetacharactersCount.reduce((previous, current) =>
    previous.count < current.count ? previous : current
  );
};

export {
  ParseFeeConfigurationSpec,
  GetApplicableFCS,
  AllocateTransactionFee,
  GetPrioritizedFCS,
  GetCache,
  SetCache,
};
