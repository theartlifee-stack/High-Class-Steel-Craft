/* ============================================================
   SHARED DATA STORE
   Acts as a simple "database" using localStorage so the Admin
   Panel and the public website stay in sync on the same browser.
   ============================================================ */

const HCSC_STORE_KEY = 'hcsc_data_v1';

const HCSC_DEFAULT_DATA = {
  settings: {
    whatsappNumber: '910000000000',
    email: 'enquiries@highclasssteelcraft.com',
    address: 'Industrial Area, Nashik, Maharashtra'
  },
  gallery: [
    {
      id: 'g1',
      title: 'Industrial Mezzanine Platform',
      category: 'structural',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=900&auto=format&fit=crop'
    },
    {
      id: 'g2',
      title: 'Powder-Coated Sliding Gate',
      category: 'gates',
      image: 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?q=80&w=900&auto=format&fit=crop'
    },
    {
      id: 'g3',
      title: 'Spiral Staircase — MS & Wood',
      category: 'staircases',
      image: 'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?q=80&w=900&auto=format&fit=crop'
    },
    {
      id: 'g4',
      title: 'Warehouse Roof Trusses',
      category: 'structural',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=900&auto=format&fit=crop'
    },
    {
      id: 'g5',
      title: 'Box Section Compound Gate',
      category: 'gates',
      image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=900&auto=format&fit=crop'
    },
    {
      id: 'g6',
      title: 'MS Frame Console Table',
      category: 'furniture',
      image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=900&auto=format&fit=crop'
    },
    {
      id: 'g7',
      title: 'Cantilever Canopy Frame',
      category: 'structural',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=900&auto=format&fit=crop'
    },
    {
      id: 'g8',
      title: 'Glass-Panel Balcony Railing',
      category: 'staircases',
      image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=900&auto=format&fit=crop'
    }
  ],
  products: [
    {
      id: 'p1',
      name: 'MS Angle Window Grill',
      category: 'Security',
      description: 'Powder-coated angle iron grill, made to your window size.',
      image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'p2',
      name: 'Spiral Staircase Kit',
      category: 'Staircases',
      description: 'Modular MS spiral staircase with checkered plate treads.',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'p3',
      name: 'Sliding Gate — Box Section',
      category: 'Gates',
      description: '50x50mm box section sliding gate with track & rollers.',
      image: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'p4',
      name: 'Industrial Shelving Rack',
      category: 'Storage',
      description: 'Heavy-duty MS angle racking, multiple tier options.',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=600&auto=format&fit=crop'
    }
  ],
  enquiries: []
};

function hcscGetData() {
  try {
    const raw = localStorage.getItem(HCSC_STORE_KEY);
    if (!raw) {
      localStorage.setItem(HCSC_STORE_KEY, JSON.stringify(HCSC_DEFAULT_DATA));
      return JSON.parse(JSON.stringify(HCSC_DEFAULT_DATA));
    }
    const parsed = JSON.parse(raw);
    // backfill any missing top-level keys for forward-compatibility
    Object.keys(HCSC_DEFAULT_DATA).forEach(k => {
      if (!(k in parsed)) parsed[k] = HCSC_DEFAULT_DATA[k];
    });
    return parsed;
  } catch (e) {
    console.error('HCSC store read error', e);
    return JSON.parse(JSON.stringify(HCSC_DEFAULT_DATA));
  }
}

function hcscSaveData(data) {
  try {
    localStorage.setItem(HCSC_STORE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('HCSC store write error', e);
    return false;
  }
}

function hcscUid(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
