"""Small machine-learning helpers: activations, losses, metrics, and data
preparation routines used in the training pipelines."""
from __future__ import annotations
import math
import random
from typing import Iterable, Iterator, Sequence, TypeVar
T = TypeVar("T")

def sigmoid(value: float) -> float:
    """Logistic activation, stable for large inputs."""
    if value >= 0:
        z = math.exp(-value)
        return 1.0 / (1.0 + z)
    z = math.exp(value)
    return z / (1.0 + z)

def relu(value: float) -> float:
    """Rectified linear activation."""
    return max(0.0, value)

def leaky_relu(value: float, slope: float = 0.01) -> float:
    """Rectified linear with a small negative gradient."""
    return value if value > 0 else slope * value

def softmax(values: Sequence[float]) -> list[float]:
    """Turn logits into a probability distribution."""
    highest = max(values)
    exponentials = [math.exp(value - highest) for value in values]
    total = sum(exponentials)
    return [value / total for value in exponentials]

def mean_squared_error(expected: Sequence[float], predicted: Sequence[float]) -> float:
    """Average squared difference between two sequences."""
    if len(expected) != len(predicted):
        raise ValueError("sequences must have equal length")
    return sum((a - b) ** 2 for a, b in zip(expected, predicted)) / len(expected)

def cross_entropy(expected: Sequence[float], predicted: Sequence[float]) -> float:
    """Categorical cross-entropy between two distributions."""
    total = 0.0
    for target, guess in zip(expected, predicted):
        guess = max(guess, 1e-12)
        total -= target * math.log(guess)
    return total / len(expected)

def accuracy(labels: Sequence[int], predictions: Sequence[int]) -> float:
    """Fraction of predictions that match their labels."""
    if len(labels) != len(predictions) or not labels:
        raise ValueError("labels and predictions must match and be non-empty")
    hits = sum(a == b for a, b in zip(labels, predictions))
    return hits / len(labels)

def train_test_split(items: Sequence[T], ratio: float = 0.8, seed: int | None = None) -> tuple[list[T], list[T]]:
    """Split items into train and test lists with a reproducible shuffle."""
    if not 0 < ratio < 1:
        raise ValueError("ratio must be between 0 and 1")
    rng = random.Random(seed)
    shuffled = list(items)
    rng.shuffle(shuffled)
    boundary = int(len(shuffled) * ratio)
    return shuffled[:boundary], shuffled[boundary:]

def min_max_scale(values: Sequence[float], feature_range: tuple[float, float] = (0.0, 1.0)) -> list[float]:
    """Scale values into a target range using observed min and max."""
    low, high = feature_range
    observed_min = min(values)
    observed_max = max(values)
    if observed_max == observed_min:
        return [(low + high) / 2] * len(values)
    span = observed_max - observed_min
    return [low + (value - observed_min) * (high - low) / span for value in values]

def confusion_matrix(labels: Sequence[int], predictions: Sequence[int], classes: int) -> list[list[int]]:
    """Build a classes x classes table of prediction outcomes."""
    matrix = [[0] * classes for _ in range(classes)]
    for actual, guess in zip(labels, predictions):
        matrix[actual][guess] += 1
    return matrix

def precision_recall(labels: Sequence[int], predictions: Sequence[int], positive: int = 1) -> tuple[float, float]:
    """Precision and recall treating *positive* as the target class."""
    true_positive = sum(a == b == positive for a, b in zip(labels, predictions))
    predicted_positive = sum(p == positive for p in predictions)
    actual_positive = sum(a == positive for a in labels)
    precision = true_positive / predicted_positive if predicted_positive else 0.0
    recall = true_positive / actual_positive if actual_positive else 0.0
    return precision, recall

def f1_score(labels: Sequence[int], predictions: Sequence[int]) -> float:
    """Harmonic mean of precision and recall for the positive class."""
    precision, recall = precision_recall(labels, predictions)
    if precision + recall == 0:
        return 0.0
    return 2 * precision * recall / (precision + recall)

def one_hot(index: int, size: int) -> list[int]:
    """Encode an index as a one-hot vector of the given size."""
    if not 0 <= index < size:
        raise ValueError("index out of range")
    vector = [0] * size
    vector[index] = 1
    return vector

def euclidean_norm(values: Sequence[float]) -> float:
    """Length of a vector."""
    return math.sqrt(sum(value * value for value in values))

def cosine_similarity(first: Sequence[float], second: Sequence[float]) -> float:
    """Cosine of the angle between two non-zero vectors."""
    if len(first) != len(second):
        raise ValueError("vectors must have equal length")
    dot = sum(a * b for a, b in zip(first, second))
    denominator = euclidean_norm(first) * euclidean_norm(second)
    if denominator == 0:
        return 0.0
    return dot / denominator

def batch_iterator(data: Sequence[T], batch_size: int) -> Iterator[list[T]]:
    """Yield fixed-size batches from a sequence."""
    if batch_size <= 0:
        raise ValueError("batch size must be positive")
    for start in range(0, len(data), batch_size):
        yield list(data[start : start + batch_size])

def weight_initializer(fan_in: int, fan_out: int) -> list[list[float]]:
    """Initialize a weight matrix using He-style scaling."""
    scale = math.sqrt(2.0 / fan_in)
    return [
        [random.uniform(-scale, scale) for _ in range(fan_out)]
        for _ in range(fan_in)
    ]

def kmeans_assign(points: Sequence[Sequence[float]], centroids: Sequence[Sequence[float]]) -> list[int]:
    """Assign each point to the index of its nearest centroid."""
    assignments: list[int] = []
    for point in points:
        distances = [
            sum((a - b) ** 2 for a, b in zip(point, centroid)) for centroid in centroids
        ]
        assignments.append(distances.index(min(distances)))
    return assignments
