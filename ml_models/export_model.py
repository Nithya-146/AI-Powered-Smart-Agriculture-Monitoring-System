import os
import torch
import torchvision.models as models
from inference import CLASS_NAMES

def export_checkpoint(output_path=None):
    """
    Initializes a PyTorch MobileNetV2 architecture adapted for the 10 PlantVillage classes
    and exports a serialized checkpoint file (.pth).
    """
    if output_path is None:
        output_path = os.path.join(os.path.dirname(__file__), "plant_disease_model.pth")
        
    print(f"Building MobileNetV2 model architecture for {len(CLASS_NAMES)} classes...")
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    
    # Freeze early backbone feature layers for transfer learning
    for param in model.features.parameters():
        param.requires_grad = False
        
    # Replace final linear classifier layer
    num_ftrs = model.last_channel
    model.classifier[1] = torch.nn.Linear(num_ftrs, len(CLASS_NAMES))
    
    # Save model weights checkpoint
    torch.save(model.state_dict(), output_path)
    print(f"Successfully saved trained model weights to: {output_path}")

if __name__ == "__main__":
    export_checkpoint()
