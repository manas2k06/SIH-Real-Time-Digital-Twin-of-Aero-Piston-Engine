import torch
import torch.nn as nn

# Use the GPU if available
device = "cuda" if torch.cuda.is_available() else "cpu"

# A tiny neural network
model = nn.Sequential(
    nn.Linear(3, 4),
    nn.ReLU(),
    nn.Linear(4, 1)
)

# Move the model to the GPU
model = model.to(device)

# Create one input with 3 numbers
x = torch.tensor([[1.0, 2.0, 3.0]], device=device)

# Ask the model to make a prediction
output = model(x)

print("Device:", device)
print("Input:", x)
print("Output:", output)
print("Model device:", next(model.parameters()).device)