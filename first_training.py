import torch
import torch.nn as nn

# Use the GPU
device = "cuda" if torch.cuda.is_available() else "cpu"

# Training data
x = torch.tensor([[1.0], [2.0], [3.0], [4.0]], device=device)
y = torch.tensor([[2.0], [4.0], [6.0], [8.0]], device=device)

# Tiny neural network
model = nn.Linear(1, 1).to(device)

# Measures how wrong the prediction is
loss_function = nn.MSELoss()

# Changes the model's weights
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

print("Starting training...")
print()

for epoch in range(1000):

    # 1. Make predictions
    predictions = model(x)

    # 2. Calculate error
    loss = loss_function(predictions, y)

    # 3. Clear old gradients
    optimizer.zero_grad()

    # 4. Calculate gradients
    loss.backward()

    # 5. Update weights
    optimizer.step()

    # Show progress every 100 epochs
    if epoch % 100 == 0:
        print(f"Epoch {epoch:4d} | Loss: {loss.item():.6f}")

print()
print("Training finished.")

# Test the trained model
test = torch.tensor([[5.0]], device=device)
prediction = model(test)

print("Input:", test.item())
print("Prediction:", prediction.item())
print("Expected: 10.0")
print("Model device:", next(model.parameters()).device)