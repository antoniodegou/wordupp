# Generated by Django 4.2.3 on 2023-09-22 17:15

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('subscription', '0007_mystripeeventmodel'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='usersubscription',
            name='pending_downgrade_date',
        ),
    ]