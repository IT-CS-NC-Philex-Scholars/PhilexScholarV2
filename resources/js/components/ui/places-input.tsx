import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

export interface PlacesInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  tooltipContent?: React.ReactNode;
  error?: string;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  componentRestrictions?: { country: string | string[] };
  types?: string[];
}

const PlacesInput = React.forwardRef<HTMLInputElement, PlacesInputProps>(
  ({
    className,
    label,
    icon,
    tooltipContent,
    error,
    onPlaceSelect,
    componentRestrictions = { country: "ph" },
    types = [],
    disabled = false,
    ...props
  }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [autocomplete, setAutocomplete] = React.useState<google.maps.places.Autocomplete | null>(null);

    React.useImperativeHandle(ref, () => inputRef.current!);

    // Initialize Google Places Autocomplete
    React.useEffect(() => {
      if (!inputRef.current || !window.google?.maps?.places?.Autocomplete) return;
      
      try {
        // Create the autocomplete instance
        const autocompleteInstance = new window.google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions,
          types,
          fields: ['address_components', 'formatted_address', 'name', 'geometry'],
        });
        
        // Set the autocomplete instance
        setAutocomplete(autocompleteInstance);
  
        // Add listener for place changes
        const listener = autocompleteInstance.addListener('place_changed', () => {
          if (!onPlaceSelect) return;
          
          const place = autocompleteInstance.getPlace();
          if (place) {
            onPlaceSelect(place);
          }
        });
  
        // Cleanup
        return () => {
          if (window.google?.maps?.event && listener) {
            window.google.maps.event.removeListener(listener);
          }
        };
      } catch (error) {
        console.error("Error initializing Places Autocomplete:", error);
      }
    }, [componentRestrictions, types, onPlaceSelect]);

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className="flex items-center gap-1.5">
            {icon}
            {label}
            {tooltipContent}
          </Label>
        )}
        <input
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={inputRef}
          disabled={disabled}
          {...props}
        />
        {error && (
          <div className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </div>
        )}
      </div>
    );
  }
);

PlacesInput.displayName = "PlacesInput";

export { PlacesInput };