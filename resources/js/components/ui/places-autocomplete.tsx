import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

// Force the Google Maps API to load only the Places library, without Maps
declare global {
  interface Window {
    initGooglePlacesOnly?: () => void;
  }
}

type PlacesAutocompleteProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  className?: string;
  icon?: React.ReactNode;
  tooltipContent?: React.ReactNode;
  componentRestrictions?: { country: string | string[] };
  types?: string[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
};

// Component for Google Places Autocomplete
export function PlacesAutocomplete({
  label,
  value,
  onChange,
  placeholder,
  onPlaceSelect,
  className,
  icon,
  tooltipContent,
  componentRestrictions = { country: 'ph' }, // Default to Philippines
  types = ['(regions)', 'locality', 'administrative_area_level_1', 'administrative_area_level_2'],
  error,
  required = false,
  disabled = false,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!inputRef.current || !window.google) return;
    
    // Create the autocomplete instance
    const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions,
      types,
      fields: ['address_components', 'formatted_address', 'name', 'geometry'],
    });
    
    // Set the autocomplete instance
    setAutocomplete(autocompleteInstance);

    // Add listener for place changes
    const listener = autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();
      if (!place || !place.address_components) return;
      
      // Extract the most appropriate component based on the field type
      if (types.includes('(regions)') || types.includes('administrative_area_level_1')) {
        // For province field - find province/region component
        const provinceComponent = place.address_components.find(component => 
          component.types.includes('administrative_area_level_1')
        );
        
        if (provinceComponent) {
          setInputValue(provinceComponent.long_name);
          onChange(provinceComponent.long_name);
        } else {
          setInputValue(place.name || '');
          onChange(place.name || '');
        }
      } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        // For city/municipality field
        const cityComponent = place.address_components.find(component => 
          component.types.includes('locality') || 
          component.types.includes('administrative_area_level_2') ||
          component.types.includes('sublocality_level_1')
        );
        
        if (cityComponent) {
          setInputValue(cityComponent.long_name);
          onChange(cityComponent.long_name);
        } else {
          setInputValue(place.name || '');
          onChange(place.name || '');
        }
      } else if (types.includes('address') || types.includes('establishment')) {
        // For street address - use the full address or route component
        const streetNumber = place.address_components.find(component => 
          component.types.includes('street_number')
        );
        
        const route = place.address_components.find(component => 
          component.types.includes('route')
        );
        
        const sublocality = place.address_components.find(component => 
          component.types.includes('sublocality') || 
          component.types.includes('neighborhood')
        );
        
        let formattedAddress = '';
        
        // Build address with number + street + neighborhood if available
        if (streetNumber) formattedAddress += streetNumber.long_name + ' ';
        if (route) formattedAddress += route.long_name;
        if (sublocality && formattedAddress) formattedAddress += ', ' + sublocality.long_name;
        
        // If we couldn't build a good address, use the formatted_address but trim city/province
        if (!formattedAddress && place.formatted_address) {
          // Try to remove city, province, and postal code from the end
          const cityComponent = place.address_components.find(component => 
            component.types.includes('locality') || 
            component.types.includes('administrative_area_level_2')
          );
          
          if (cityComponent && place.formatted_address.includes(cityComponent.long_name)) {
            formattedAddress = place.formatted_address.split(cityComponent.long_name)[0].trim();
            // Remove trailing comma if any
            formattedAddress = formattedAddress.replace(/,\s*$/, '');
          } else {
            formattedAddress = place.formatted_address;
          }
        }
        
        setInputValue(formattedAddress || place.name || '');
        onChange(formattedAddress || place.name || '');
      } else {
        // For any other type of field, use the formatted name
        setInputValue(place.name || '');
        onChange(place.name || '');
      }
      
      if (onPlaceSelect) {
        onPlaceSelect(place);
      }
    });

    // Cleanup
    return () => {
      if (google.maps.event && listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [window.google, types, componentRestrictions]);

  // Handle user input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  // Sync input value with passed value prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={label.replace(/\s+/g, '-').toLowerCase()} className="flex items-center gap-1.5">
        {icon}
        {label}
        {tooltipContent}
      </Label>
      <Input
        id={label.replace(/\s+/g, '-').toLowerCase()}
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
      {error && (
        <div className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}
    </div>
  );
}