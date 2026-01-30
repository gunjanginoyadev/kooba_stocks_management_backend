class Stock {
  constructor(id, name, type) {
    this.id = id;
    this.name = name;
    this.type = type;
  }
}

class SubStock {
  constructor(id, parentStockId, name) {
    this.id = id;
    this.parentStockId = parentStockId;
    this.name = name;
  }
}

export {
  Stock,
  SubStock,
};

