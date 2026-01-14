import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Sponsor {
  id: string;
  name: string;
  icon_url: string;
  link: string;
}

const SponsorCarousel = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    const fetchSponsors = async () => {
      const { data } = await supabase
        .from('sponsors')
        .select('*')
        .eq('is_active', true);
      
      if (data) setSponsors(data);
    };

    fetchSponsors();
  }, []);

  if (sponsors.length === 0) return null;

  // Duplicate sponsors for infinite scroll effect
  const duplicatedSponsors = [...sponsors, ...sponsors];

  return (
    <div className="w-full overflow-hidden bg-secondary/50 py-4 border-y border-border">
      <div className="flex sponsor-scroll" style={{ width: `${duplicatedSponsors.length * 200}px` }}>
        {duplicatedSponsors.map((sponsor, index) => (
          <a
            key={`${sponsor.id}-${index}`}
            href={sponsor.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-6 min-w-[180px] hover:opacity-80 transition-opacity"
          >
            <img
              src={sponsor.icon_url}
              alt={sponsor.name}
              className="w-10 h-10 object-contain rounded-lg"
            />
            <span className="text-sm font-medium text-foreground/70">{sponsor.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SponsorCarousel;
