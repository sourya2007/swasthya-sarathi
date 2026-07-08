import { useState, useEffect } from 'react';

const MEDICINES = [
  "Paracetamol (500mg)", "ORS Packets", "Amoxicillin (250mg)", "Ibuprofen (400mg)",
  "Cetirizine (10mg)", "Azithromycin (500mg)", "Omeprazole (20mg)", "Diclofenac",
  "Ciprofloxacin (500mg)", "Metronidazole (400mg)", "Salbutamol Inhaler", "Aspirin (75mg)",
  "Amlodipine (5mg)", "Metformin (500mg)", "Losartan (50mg)", "Pantoprazole (40mg)",
  "Albendazole (400mg)", "Iron & Folic Acid", "Calcium + Vitamin D3", "B-Complex",
  "Doxycycline (100mg)", "Fluconazole (150mg)", "Ceftriaxone Injection", "Tetanus Toxoid",
  "Rabies Vaccine", "Anti-Snake Venom", "IV Fluids (NS 500ml)", "IV Fluids (RL 500ml)",
  "Hydrocortisone Injection", "Adrenaline Injection"
];

const LOCATIONS = [
  { id: "PHC-01", name: "Kundanpur PHC", lat: 22.5726, lng: 88.3639, address: "Kundanpur Village, Purba Bardhaman" },
  { id: "PHC-02", name: "Palashbari PHC", lat: 22.6026, lng: 88.3539, address: "Palashbari Road, Jalpaiguri" },
  { id: "CHC-01", name: "Bishnupur CHC", lat: 22.5826, lng: 88.3839, address: "Bishnupur Main Market, Bankura" },
  { id: "PHC-03", name: "Sonapur PHC", lat: 22.5526, lng: 88.3239, address: "Sonapur Highway, South 24 Parganas" },
  { id: "PHC-04", name: "Rampur PHC", lat: 22.5126, lng: 88.3039, address: "Rampur, Birbhum" },
  { id: "PHC-05", name: "Shyampur PHC", lat: 22.6226, lng: 88.4039, address: "Shyampur, Howrah" },
  { id: "CHC-02", name: "Govindapur CHC", lat: 22.6526, lng: 88.4539, address: "Govindapur, Purulia" },
  { id: "PHC-06", name: "Nandigram PHC", lat: 22.6826, lng: 88.4239, address: "Nandigram, Purba Medinipur" },
  { id: "PHC-07", name: "Haldia PHC", lat: 22.7026, lng: 88.4839, address: "Haldia, Purba Medinipur" },
  { id: "PHC-08", name: "Contai PHC", lat: 22.7226, lng: 88.5039, address: "Contai, Purba Medinipur" },
  { id: "CHC-03", name: "Digha CHC", lat: 22.7526, lng: 88.5539, address: "Digha, Purba Medinipur" },
  { id: "PHC-09", name: "Tamluk PHC", lat: 22.7826, lng: 88.5839, address: "Tamluk, Purba Medinipur" },
  { id: "PHC-10", name: "Kolaghat PHC", lat: 22.8026, lng: 88.6039, address: "Kolaghat, Purba Medinipur" },
  { id: "PHC-11", name: "Mecheda PHC", lat: 22.8226, lng: 88.6239, address: "Mecheda, Purba Medinipur" },
  { id: "CHC-04", name: "Kharagpur CHC", lat: 22.8526, lng: 88.6539, address: "Kharagpur, Paschim Medinipur" },
  { id: "PHC-12", name: "Midnapore PHC", lat: 22.8826, lng: 88.6839, address: "Midnapore, Paschim Medinipur" },
  { id: "PHC-13", name: "Jhargram PHC", lat: 22.9026, lng: 88.7039, address: "Jhargram, Jhargram" },
  { id: "PHC-14", name: "Purulia PHC", lat: 22.9226, lng: 88.7239, address: "Purulia, Purulia" },
  { id: "CHC-05", name: "Bankura CHC", lat: 22.9526, lng: 88.7539, address: "Bankura, Bankura" },
  { id: "PHC-15", name: "Burdwan PHC", lat: 22.9826, lng: 88.7839, address: "Burdwan, Purba Bardhaman" },
];

export interface InventoryItem {
  name: string;
  stock: number;
  maxStock: number;
  status: 'OK' | 'LOW' | 'CRITICAL';
}

export interface ResourceData {
  id: string;
  name: string;
  type: 'PHC' | 'CHC';
  beds: number;
  totalBeds: number;
  doctors: number;
  totalDoctors: number;
  inventory: InventoryItem[];
  status: 'OK' | 'WARNING' | 'CRITICAL';
  lat: number;
  lng: number;
  address: string;
}

const generateInitialData = (): ResourceData[] => {
  return LOCATIONS.map((loc) => {
    const isCHC = loc.id.startsWith("CHC");
    const totalBeds = isCHC ? 50 : 20;
    const totalDoctors = isCHC ? 15 : 5;
    
    const inventory = MEDICINES.map(med => {
      const maxStock = isCHC ? 500 : 100;
      const stock = Math.floor(Math.random() * maxStock);
      let status: 'OK' | 'LOW' | 'CRITICAL' = 'OK';
      if (stock < maxStock * 0.1) status = 'CRITICAL';
      else if (stock < maxStock * 0.3) status = 'LOW';
      
      return {
        name: med,
        stock,
        maxStock,
        status
      };
    });

    const beds = Math.floor(Math.random() * totalBeds);
    const doctors = Math.floor(Math.random() * totalDoctors) + 1;

    let overallStatus: 'OK' | 'WARNING' | 'CRITICAL' = 'OK';
    const criticalMedCount = inventory.filter(i => i.status === 'CRITICAL').length;
    if (criticalMedCount > 5 || beds / totalBeds < 0.1 || doctors / totalDoctors < 0.2) {
      overallStatus = 'CRITICAL';
    } else if (criticalMedCount > 2 || beds / totalBeds < 0.3 || doctors / totalDoctors < 0.5) {
      overallStatus = 'WARNING';
    }

    return {
      ...loc,
      type: isCHC ? 'CHC' : 'PHC',
      beds,
      totalBeds,
      doctors,
      totalDoctors,
      inventory,
      status: overallStatus
    };
  });
};

export function useResourceMonitoring() {
  const [resources, setResources] = useState<ResourceData[]>(generateInitialData);

  useEffect(() => {
    const interval = setInterval(() => {
      setResources(current => 
        current.map(centre => {
          // Randomize some values slightly
          let newBeds = centre.beds + (Math.floor(Math.random() * 3) - 1);
          if (newBeds < 0) newBeds = 0;
          if (newBeds > centre.totalBeds) newBeds = centre.totalBeds;

          // Occasionally change doctor attendance
          let newDoctors = centre.doctors;
          if (Math.random() < 0.1) {
             newDoctors = centre.doctors + (Math.floor(Math.random() * 3) - 1);
             if (newDoctors < 1) newDoctors = 1;
             if (newDoctors > centre.totalDoctors) newDoctors = centre.totalDoctors;
          }

          const newInventory = centre.inventory.map(med => {
            let newStock = med.stock - Math.floor(Math.random() * 5);
            if (newStock < 0) newStock = 0;
            
            let status: 'OK' | 'LOW' | 'CRITICAL' = 'OK';
            if (newStock < med.maxStock * 0.1) status = 'CRITICAL';
            else if (newStock < med.maxStock * 0.3) status = 'LOW';
            
            return { ...med, stock: newStock, status };
          });

          let overallStatus: 'OK' | 'WARNING' | 'CRITICAL' = 'OK';
          const criticalMedCount = newInventory.filter(i => i.status === 'CRITICAL').length;
          if (criticalMedCount > 5 || newBeds / centre.totalBeds < 0.1 || newDoctors / centre.totalDoctors < 0.2) {
            overallStatus = 'CRITICAL';
          } else if (criticalMedCount > 2 || newBeds / centre.totalBeds < 0.3 || newDoctors / centre.totalDoctors < 0.5) {
            overallStatus = 'WARNING';
          }

          return {
            ...centre,
            beds: newBeds,
            doctors: newDoctors,
            inventory: newInventory,
            status: overallStatus
          };
        })
      );
    }, 5000); // update every 5 seconds for simulation

    return () => clearInterval(interval);
  }, []);

  return resources;
}
