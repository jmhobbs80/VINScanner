
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type ManualEntryModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (vin: string) => void;
};

export default function ManualEntryModal({ visible, onCancel, onSubmit }: ManualEntryModalProps) {
  const [vin, setVin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    // VIN validation - must be 17 characters
    if (vin.length !== 17) {
      toast({
        title: "Invalid VIN",
        description: "VIN must be exactly 17 characters",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    onSubmit(vin);
    setIsSubmitting(false);
    setVin(""); // Reset field after submission
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Pencil className="h-5 w-5 mr-2" />
            Manual VIN Entry
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Enter the 17-character Vehicle Identification Number (VIN) below:
          </p>
          
          <input
            type="text"
            className="w-full p-3 border rounded-md font-mono uppercase"
            placeholder="E.g. 1HGCM82633A004352"
            value={vin}
            onChange={(e) => setVin(e.target.value.toUpperCase())}
            maxLength={17}
            autoFocus
          />
          
          <p className="text-xs text-muted-foreground">
            The VIN is typically located on the driver's side dashboard near the windshield 
            or inside the driver's door jamb.
          </p>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className={vin.length === 17 ? "bg-green-600 hover:bg-green-700" : ""}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
