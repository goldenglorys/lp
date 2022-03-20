const ParseFeeConfigurationSpec = async (Specs) => {
  const FCS = await Specs.map((FCS) => {
    let SpecObj = {
      FeeId: FCS.split(" ")[0],
      FeeCurrency: FCS.split(" ")[1],
      FeeLocale: FCS.split(" ")[2],
      FeeEntity: FCS.split(" ")[3].split("(")[0],
      FeeEntityProperty: FCS.split(" ")[3].split("(")[1].replace(")", ""),
      FeeType: FCS.split(" ")[6],
      value: FCS.split(" ")[7],
    };
    return SpecObj;
  });
  return FCS;
};

export { ParseFeeConfigurationSpec };