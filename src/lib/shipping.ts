export interface ShippingQuote {
  fee: number;
  distanceKm: number;
  zoneLabel: string;
  etaLabel: string;
  etaDays: number;
}

const shippingZones = [
  {
    zoneLabel: "Mira Road",
    distanceKm: 4,
    fee: 29,
    etaDays: 1,
    matches: ["mira road", "mira bhayandar", "401107", "401101", "401105", "401104"],
  },
  {
    zoneLabel: "Western suburbs",
    distanceKm: 18,
    fee: 49,
    etaDays: 1,
    matches: ["borivali", "kandivali", "malad", "goregaon", "andheri", "jogeshwari", "401", "400092", "400103"],
  },
  {
    zoneLabel: "Mumbai metro",
    distanceKm: 34,
    fee: 79,
    etaDays: 2,
    matches: ["mumbai", "thane", "powai", "bandra", "kurla", "chembur", "navi mumbai", "400", "421", "410"],
  },
  {
    zoneLabel: "Maharashtra regional",
    distanceKm: 155,
    fee: 119,
    etaDays: 3,
    matches: ["pune", "nashik", "nagpur", "kolhapur", "aurangabad", "maharashtra"],
  },
  {
    zoneLabel: "West India",
    distanceKm: 520,
    fee: 159,
    etaDays: 4,
    matches: ["gujarat", "goa", "rajasthan", "madhya pradesh", "indore", "surat", "ahmedabad", "vadodara", "jaipur"],
  },
];

const defaultQuote: ShippingQuote = {
  fee: 199,
  distanceKm: 1280,
  zoneLabel: "Pan-India",
  etaLabel: "5-7 days",
  etaDays: 6,
};

function buildEtaLabel(etaDays: number) {
  if (etaDays <= 1) {
    return "Same or next day";
  }
  if (etaDays === 2) {
    return "2-3 days";
  }
  if (etaDays === 3) {
    return "3-4 days";
  }
  if (etaDays === 4) {
    return "4-5 days";
  }
  return "5-7 days";
}

export function getShippingQuote(address?: string | null, subtotal = 0): ShippingQuote {
  const normalizedAddress = address?.trim().toLowerCase() ?? "";
  const matchedZone =
    shippingZones.find((zone) => zone.matches.some((token) => normalizedAddress.includes(token))) ?? defaultQuote;

  const baseFee = subtotal >= 2999 || subtotal === 0 ? 0 : matchedZone.fee;

  return {
    fee: baseFee,
    distanceKm: matchedZone.distanceKm,
    zoneLabel: matchedZone.zoneLabel,
    etaDays: matchedZone.etaDays,
    etaLabel: buildEtaLabel(matchedZone.etaDays),
  };
}

export function getOrderTrackingSteps(createdAt: string, status: string) {
  const createdTime = new Date(createdAt).getTime();
  const shippedAt = new Date(createdTime + 1000 * 60 * 60 * 18).toISOString();
  const outForDeliveryAt = new Date(createdTime + 1000 * 60 * 60 * 42).toISOString();
  const deliveredAt = new Date(createdTime + 1000 * 60 * 60 * 72).toISOString();

  const paidStatuses = new Set(["paid", "fulfilled"]);
  const deliveredStatuses = new Set(["fulfilled"]);

  return [
    { title: "Order placed", description: "We received your order and started processing it.", at: createdAt, done: true },
    {
      title: "Packed at Mira Road",
      description: "Items are packed and ready to move from the Mira Road hub.",
      at: shippedAt,
      done: paidStatuses.has(status),
    },
    {
      title: "Out for delivery",
      description: "Your package is moving through the last-mile delivery network.",
      at: outForDeliveryAt,
      done: deliveredStatuses.has(status),
    },
    {
      title: "Delivered",
      description: "The order has reached the delivery address successfully.",
      at: deliveredAt,
      done: deliveredStatuses.has(status),
    },
  ];
}
