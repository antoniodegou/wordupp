# Generated by Django 4.2.3 on 2023-09-21 12:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subscription', '0005_alter_usersubscription_end_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='usersubscription',
            name='stripe_subscription_id',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
