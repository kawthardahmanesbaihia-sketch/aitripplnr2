export type Package = {
  id:               string;
  title:            string;
  destination:      string;
  country?:         string;
  price:            number;
  duration:         string;
  image:            string;
  tags:             string[];
  description:      string;
  includedServices?: string;
  excludedServices?: string;
  status?:          "draft" | "active" | "featured";
  agencyId:         string;
  agencyName:       string;
  contactEmail?:    string;
  contactPhone?:    string;
  createdAt:        string;
};
