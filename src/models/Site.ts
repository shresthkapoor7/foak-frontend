export class Site {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;

  constructor(
    id: string,
    name: string,
    latitude: number,
    longitude: number,
    description: string
  ) {
    this.id = id;
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.description = description;
  }
}
