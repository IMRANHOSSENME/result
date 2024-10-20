document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const rollNumber = urlParams.get('rollNumber');
    const examination = urlParams.get('examination');
    const regulation = urlParams.get('regulation');

    if (rollNumber && examination && regulation) {
        fetch(`http://127.0.0.1:5000/result?rollNumber=${rollNumber}&examination=${examination}&regulation=${regulation}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                    return;
                }

                if (data.length > 0) {
                    const result = data[0];
                    document.getElementById('roll_number').textContent = result.roll_number;
                    document.getElementById('publish_date').textContent = result.publish_date;
                    document.getElementById('type').textContent = "Regular";
                    document.getElementById('ngpa').textContent = result.GPA ? `${result.GPA.toFixed(2)}` : 'N/A';
                    document.getElementById('status').textContent = result.type === 'Failed' ? 'Failed' : 'Passed';
                    document.getElementById('status').className = result.type === 'Failed' ? 'status-failed' : 'status-passed';
                    document.getElementById('polytechnic_name').textContent = result.polytechnic_name;
                    document.getElementById('regulation').textContent = result.regulation;
                    document.getElementById('semester').textContent = result.semester;

                    // Handle referred subjects and grades
                    let referredSubjects = result.referred_subjects || 'N/A';
                    if (result.referred_t === 1) {
                        referredSubjects += ' (T)';
                    }
                    if (result.referred_p === 1) {
                        referredSubjects += ' (P)';
                    }
                    document.getElementById('referred_subjects').textContent = referredSubjects;
                    document.getElementById('ngrade').textContent = result.grade || 'N/A';
                } else {
                    console.error('No result found');
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    } else {
        console.error('Invalid input parameters.');
    }

    if (rollNumber) {
        fetchResults(rollNumber);
    }
});

function fetchResults(rollNumber) {
    const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
    const semesterGPA = {};

    Promise.all(semesters.map(semester => 
        fetch(`http://127.0.0.1:5000/${semester}?rollNumber=${rollNumber}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                    return;
                }
                if (data.length > 0) {
                    const result = data[0];
                    semesterGPA[semester] = {
                        GPA: result.GPA || 'N/A',
                        grade: result.grade || 'N/A'
                    };
                    document.getElementById(`s${semester}_gpa`).textContent = semesterGPA[semester].GPA.toFixed(2);
                    document.getElementById(`s${semester}_grade`).textContent = semesterGPA[semester].grade;
                }
            })
            .catch(error => console.error('Error fetching data:', error))
    )).then(() => {
        calculateAndDisplayCGPA(semesterGPA);
    });
}

function gradeCalculation(CGPA) {
    CGPA = parseFloat(CGPA.toFixed(2));

    if (CGPA === 4.0) {
        return "A+";
    } else if (CGPA >= 3.75 && CGPA < 4.0) {
        return "A";
    } else if (CGPA >= 3.5 && CGPA < 3.75) {
        return "A-";
    } else if (CGPA >= 3.25 && CGPA < 3.5) {
        return "B+";
    } else if (CGPA >= 3.0 && CGPA < 3.25) {
        return "B";
    } else if (CGPA >= 2.75 && CGPA < 3.0) {
        return "B-";
    } else if (CGPA >= 2.5 && CGPA < 2.75) {
        return "C+";
    } else if (CGPA >= 2.25 && CGPA < 2.5) {
        return "C";
    } else if (CGPA >= 2.0 && CGPA < 2.25) {
        return "D";
    } else if (CGPA === 0.0) {
        return "F";
    } else {
        return "?";
    }
}

function calculateCGPA(semesters) {
    let defaultWeights = [0.05, 0.05, 0.10, 0.10, 0.20, 0.20, 0.20, 0.10];
    let validSemesters = Object.values(semesters).map(semester => parseFloat(semester.GPA)).filter(gpa => !isNaN(gpa) && gpa !== 0);
    let validWeights = defaultWeights.slice(0, validSemesters.length);
    
    if (validSemesters.length === 0) {
        return 0;
    }

    let weightSum = validWeights.reduce((a, b) => a + b, 0);
    let normalizedWeights = validWeights.map(weight => weight / weightSum);
    let weightedSum = validSemesters.reduce((sum, semester, index) => sum + semester * normalizedWeights[index], 0);

    return weightedSum;
}

function calculateAndDisplayCGPA(semesterGPA) {
    let cgpa = calculateCGPA(semesterGPA);
    let grade = gradeCalculation(cgpa);

    document.getElementById('CGPA').innerText = cgpa.toFixed(2);
    document.getElementById('GRADE').innerText = grade;
}

function searchAgain() {
    window.location.href = 'result.html';
}
