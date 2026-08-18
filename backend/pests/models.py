from django.db import models

class PestCalendar(models.Model):
    RISK_LEVEL_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]

    crop = models.CharField(max_length=100)
    pest_name = models.CharField(max_length=200)
    scientific_name = models.CharField(max_length=200, blank=True, default='')
    start_month = models.IntegerField(help_text='1=Jan, 12=Dec')
    end_month = models.IntegerField(help_text='1=Jan, 12=Dec')
    risk_level = models.CharField(max_length=20, choices=RISK_LEVEL_CHOICES, default='Medium')
    symptoms = models.TextField()
    prevention_measures = models.TextField()
    organic_controls = models.TextField(blank=True, default='')
    chemical_controls = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.crop} - {self.pest_name} (Months {self.start_month}-{self.end_month})"
