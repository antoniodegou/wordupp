# Generated by Django 4.2.3 on 2023-09-17 10:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('WordUpp', '0003_canvas_word_objects'),
    ]

    operations = [
        migrations.AddField(
            model_name='canvas',
            name='horizontal_slider_value',
            field=models.IntegerField(default=1),
        ),
        migrations.AddField(
            model_name='canvas',
            name='vertical_slider_value',
            field=models.IntegerField(default=1),
        ),
    ]