// Test the grade color mapping logic
const testGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'N/A'];

console.log('Grade Color Mapping Test:');
console.log('========================');

testGrades.forEach(grade => {
  let colorClass = '';
  if (grade === 'A' || grade === 'A-' || grade === 'A+') {
    colorClass = 'text-green-600';
  } else if (grade === 'B' || grade === 'B-' || grade === 'B+') {
    colorClass = 'text-green-500';
  } else if (grade === 'C' || grade === 'C-' || grade === 'C+') {
    colorClass = 'text-yellow-500';
  } else if (grade === 'D' || grade === 'D-' || grade === 'D+') {
    colorClass = 'text-orange-500';
  } else if (grade === 'F') {
    colorClass = 'text-red-500';
  } else {
    colorClass = 'text-gray-500';
  }
  
  console.log(`${grade}: ${colorClass}`);
});

console.log('\n✅ Grade color mapping test complete!');